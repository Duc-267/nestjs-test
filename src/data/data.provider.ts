import * as mongoose from 'mongoose';
import { DataConstants } from './data.constants';

export const dataProviders = [
  {
    provide: DataConstants.dbToken,
    useFactory: async (): Promise<typeof mongoose> => {
      const mongooseInstance = await mongoose.connect(
        process.env.DB_CONNECTION || '',
        {},
      );
      return mongooseInstance;
    },
  },
];
