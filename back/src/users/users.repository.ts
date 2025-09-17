import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';
import { UpdateUserDTO } from './dto/users.dto';
import * as countryCodeLookup from 'country-code-lookup';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private getCountryCode(input: string): CountryCode {
    if (!input) throw new BadRequestException('Country input is required');

    const normalizedInput = input.toLowerCase().trim();

    const countryData =
      countryCodeLookup.byCountry(input) ||
      countryCodeLookup.byIso(input) ||
      countryCodeLookup.countries.find(
        (country) =>
          country.country.toLowerCase() === normalizedInput ||
          country.iso2.toLowerCase() === normalizedInput ||
          country.iso3.toLowerCase() === normalizedInput,
      );
    if (!countryData || !countryData.iso2)
      throw new BadRequestException(`Invalid country: ${input}`);

    return countryData.iso2 as CountryCode;
  }

  async signUp(user: Partial<User>) {
    const newUser = await this.userRepository.save(user);

    const dbUser = await this.userRepository.findOneBy({ id: newUser.id });
    if (!dbUser) throw new NotFoundException('User not found');

    //Para no mostrar la contraseña del usuario
    const { password, ...filteredData } = dbUser;
    return filteredData;
  }

  async getUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const users = await this.userRepository.find({
      take: limit,
      skip: skip,
    });

    return users.map(({ password, ...userNoPassord }) => userNoPassord);
  }

  async getUsersByRole(role: string) {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('LOWER(user.role) = LOWER(:role)', { role })
      .getMany();

    return users.map(({ password, ...userNoPassword }) => userNoPassword);
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['professional'],
    });

    if (!user) throw new NotFoundException(`User whit id ${id} not found`);

    const { password, ...filteredData } = user;
    return filteredData;
  }

  async createUser(user: Partial<User>) {
    return this.userRepository.save(user);
  }

  async updateUser(userId: string, user: UpdateUserDTO) {
    const foundUser = await this.userRepository.findOneBy({ id: userId });
    if (!foundUser)
      throw new NotFoundException(`User whit id ${userId} not found`);

    if (!foundUser)
      throw new NotFoundException(`User whith id ${userId} not found`);

    if (user.phone) {
      const country = user.country || foundUser.country || '';

      if (!country)
        throw new BadRequestException(
          'Country is required for phone validation',
        );

      try {
        const countryCode = this.getCountryCode(country);
        const phoneNumber = parsePhoneNumberFromString(user.phone, countryCode);

        if (!phoneNumber || !phoneNumber.isValid())
          throw new BadRequestException(
            'Invalid phone number for the selected country',
          );

        user.phone = phoneNumber.formatInternational();
        user.country = countryCode;
      } catch (error) {
        if (error instanceof BadRequestException) throw error;

        throw new BadRequestException('Failed to validate phone number');
      }
    }

    await this.userRepository.update(userId, {
      ...user,
      updatedAt: new Date(),
    });

    const updatedUser = await this.userRepository.findOneBy({ id: userId });
    if (!updatedUser)
      throw new NotFoundException(
        `User whith id ${userId} not found after update`,
      );

    const { password, role, ...filteredData } = updatedUser;
    return filteredData;
  }

  async deleteUser(id: string) {
    const foundUser = await this.userRepository.findOneBy({ id });
    if (!foundUser)
      throw new NotFoundException(`User whith id ${id} not found`);

    if (!foundUser.isActive)
      throw new BadRequestException(`User whith id ${id} is already inactive`);

    //Soft delete: marca como inactivo en lugar de eliminar
    await this.userRepository.update(id, {
      isActive: false,
      updatedAt: new Date(),
    });

    const updatedUser = await this.userRepository.findOneBy({ id });
    if (!updatedUser)
      throw new NotFoundException(`User whit id ${id} not found after update`);

    const { password, role, ...filteredUserData } = updatedUser;
    return filteredUserData;
  }

  async reactivateUser(id: string) {
    const foundUser = await this.userRepository.findOneBy({ id });
    if (!foundUser)
      throw new NotFoundException(`User whith id ${id} not found`);
    if (foundUser.isActive)
      throw new BadRequestException(`User whit id ${id} is already active`);

    await this.userRepository.update(id, {
      isActive: true,
      updatedAt: new Date(),
    });

    const updatedUser = await this.userRepository.findOneBy({ id });
    if (!updatedUser)
      throw new NotFoundException(`User whit id ${id} not found after update`);

    const { password, role, ...filteredData } = updatedUser;
    return filteredData;
  }
}
