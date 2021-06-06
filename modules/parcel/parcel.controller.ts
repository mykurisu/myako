import { Controller, Post, UseInterceptors, UploadedFiles } from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { ParcelService } from './parcel.service'


@Controller('/parcel')
@UseInterceptors(FileFieldsInterceptor([
    { name: 'orderList', maxCount: 1 },
    { name: 'parcelList', maxCount: 1 }
]))
export class ParcelController {

    constructor(
        private readonly parcelService: ParcelService
    ) {}

    @Post('/matchParcelCode')
    async matchParcelCode(
        @UploadedFiles() files: any,
    ) {
        const res = await this.parcelService.matchParcelCode(files)
        return res
    }

}
