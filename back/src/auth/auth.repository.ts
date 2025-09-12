import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Professional } from 'src/professional/entity/professional.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { DeepPartial } from 'typeorm';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Professional)
    private readonly professionalRepository: Repository<Professional>,
  ) {}
  async createUser(userInput: Partial<User>) {
    const newUser = await this.userRepository.save(userInput);

    if (newUser.role?.toString().toUpperCase() === 'PROFESSIONAL') {
      await this.professionalRepository.insert({
        user: { id: newUser.id } as User,
      });
    }

    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  // async createUser(user: Partial<User>) {
  //   const newUser = await this.userRepository.save(user);
  //   const dataBase = await this.userRepository.findOneBy({ id: newUser.id });
  //   if (!dataBase) throw new Error('User not found after creation');
  //   const { password, ...userWithoutPassword } = newUser;
  //   return userWithoutPassword;
  // }
  async findByEmail(email: string) {
    return this.userRepository
      .createQueryBuilder('u')
      .addSelect('u.password')
      .where('u.email = :email', { email })
      .getOne();
  }

  async findByGoogleId(providerId: string) {
    return this.userRepository.findOne({ where: { providerId } });
  }

  async findOrCreateFromGoogle(
    profile: {
      providerId: string;
      email: string;
      name: string;
      picture?: string;
    },
    roleHint: 'user' | 'professional',
  ): Promise<User> {
    let user = await this.findByGoogleId(profile.providerId);
    if (user) return user;

    user = await this.findByEmail(profile.email);
    if (user) {
      if (!user.providerId) user.providerId = profile.providerId;
      if (!user.firstName) user.firstName = profile.name;
      if (!user.profileImage) user.profileImage = profile.picture ?? null;
      return this.userRepository.save(user);
    }

    const toCreate: DeepPartial<User> = {
      providerId: profile.providerId,
      email: profile.email,
      firstName: profile.name,
      profileImage: profile.picture ?? null,
      role: roleHint,
    };
    return this.userRepository.save(toCreate);
  }

  async save(user: DeepPartial<User> | User): Promise<User> {
    return this.userRepository.save(user as any);
  }
}
