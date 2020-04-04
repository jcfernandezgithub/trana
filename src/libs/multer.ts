import fs from 'fs';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
	destination: (req, file, cb) => {

		let fileLocation = 'uploads/' + req.params.id + '/';
		if (!fs.existsSync(fileLocation)) {
			fs.mkdirSync(fileLocation);
		}
		cb(null, fileLocation);
	},
	filename: (req, file, cb) => {
		cb(null, uuidv4() + '.jpeg');
	}
});

export default multer({ storage: storage });