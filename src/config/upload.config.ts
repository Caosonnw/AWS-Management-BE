import { diskStorage } from 'multer';
import { join } from 'path';

export const uploadOptions = {
  storage: diskStorage({
    destination: join(process.cwd(), 'public/img'),
    filename: (req, file, callback) => {
      const mSecond = new Date().getTime();
      const uniqueSuffix = mSecond + '_' + Math.round(Math.random() * 1e9);
      const sanitizedFilename = file.originalname.replace(/\s+/g, '_');
      callback(null, `${uniqueSuffix}_${sanitizedFilename}`);
    },
  }),
};
