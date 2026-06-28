import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from './app.module';
import { User, UserDocument } from './users/schemas/user.schema';

const seedUsers = [
    {
        name: 'Super Admin',
        email: 'superadmin@example.com',
        password: 'admin123',
        role: 'admin',
        isActive: true,
    },
    {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'user',
        isActive: true,
    },
    {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: 'password123',
        role: 'user',
        isActive: true,
    },
    {
        name: 'Alice Williams',
        email: 'alice@example.com',
        password: 'password123',
        role: 'user',
        isActive: true,
    },
    {
        name: 'Deactivated User',
        email: 'inactive@example.com',
        password: 'password123',
        role: 'user',
        isActive: false,
    },
];

async function runSeeder() {
    console.log(' Starting database seeder...\n');

    const app = await NestFactory.createApplicationContext(AppModule);

    try {
        const userModel = app.get<Model<UserDocument>>(
            getModelToken(User.name),
        );

        const deleted = await userModel.deleteMany({});
        console.log(`  Cleared ${deleted.deletedCount} existing users\n`);

        const createdUsers = [];
        for (const userData of seedUsers) {
            const user = await userModel.create(userData);
            createdUsers.push(user);
            console.log(
                ` Created: ${user.name} (${user.email}) | Role: ${user.role} | Active: ${user.isActive}`,
            );
        }

        console.log(`\n Seeding complete! ${createdUsers.length} users created.\n`);

        console.log('Test Credentials:');
        console.log('─────────────────────────────────────────');
        console.log('ADMIN  → superadmin@example.com / admin123');
        console.log('USER 1 → jane@example.com / password123');
        console.log('USER 2 → bob@example.com / password123');

    } catch (error: any) {
        console.error(' Seeding failed:', error?.message ?? error);
    } finally {
        await app.close();
        process.exit(0);
    }
}

runSeeder();