"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const argon2 = __importStar(require("argon2"));
const prisma = new client_1.PrismaClient();
async function main() {
    const school = await prisma.school.upsert({
        where: { slug: 'colegio-aurora' },
        update: {},
        create: {
            name: 'Colégio Aurora',
            slug: 'colegio-aurora',
            email: 'contato@aurora.edu.br',
            phone: '(11) 99999-0000',
            city: 'São Paulo',
            state: 'SP',
        },
    });
    const hash = await argon2.hash('senha123');
    await prisma.user.upsert({
        where: { id: 'seed-admin' },
        update: {},
        create: {
            id: 'seed-admin',
            schoolId: school.id,
            email: 'admin@aurora.edu.br',
            passwordHash: hash,
            name: 'Admin EduPulse',
            role: client_1.UserRole.SCHOOL_ADMIN,
        },
    });
    await prisma.user.upsert({
        where: { id: 'seed-coordinator' },
        update: {},
        create: {
            id: 'seed-coordinator',
            schoolId: school.id,
            email: 'coord@aurora.edu.br',
            passwordHash: hash,
            name: 'Coordenadora Silva',
            role: client_1.UserRole.COORDINATOR,
        },
    });
    console.log('Seed concluído — escola:', school.name);
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map