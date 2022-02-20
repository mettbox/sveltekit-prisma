// import Prisma, * as PrismaAll from "@prisma/client";

// const PrismaClient = Prisma?.PrismaClient || PrismaAll?.PrismaClient;
// export default PrismaClient;

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export default PrismaClient
