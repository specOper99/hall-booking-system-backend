import {
    BadRequestException,
    Controller,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png'];

const storage = diskStorage({
    destination: './uploads',
    filename: (_req, file, callback) => {
        const uniqueName = `${uuidv4()}${extname(file.originalname).toLowerCase()}`;
        callback(null, uniqueName);
    },
});

const fileFilter = (
    _req: unknown,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
) => {
    const ext = extname(file.originalname).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return callback(
            new BadRequestException(
                `Invalid file type. Only ${ALLOWED_EXTENSIONS.join(', ')} are allowed`,
            ),
            false,
        );
    }

    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
        return callback(
            new BadRequestException(
                'Invalid file mimetype. Only JPEG and PNG images are allowed',
            ),
            false,
        );
    }

    callback(null, true);
};

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @UseInterceptors(
        FileInterceptor('file', {
            storage,
            fileFilter,
            limits: { fileSize: MAX_FILE_SIZE },
        }),
    )
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiOperation({ summary: 'Upload an image file' })
    @ApiResponse({
        status: 201,
        description: 'File uploaded successfully',
        schema: {
            type: 'object',
            properties: {
                url: { type: 'string', example: '/uploads/abc123.jpg' },
                filename: { type: 'string', example: 'abc123.jpg' },
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Invalid file type or size' })
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        return {
            url: `/uploads/${file.filename}`,
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
        };
    }
}
