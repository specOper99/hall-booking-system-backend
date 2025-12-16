export declare class UploadsController {
    uploadFile(file: Express.Multer.File): {
        url: string;
        filename: string;
        originalName: string;
        size: number;
    };
}
