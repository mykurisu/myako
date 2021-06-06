import { Module } from '@nestjs/common'
import { ParcelController } from './parcel.controller'
import { ParcelService } from './parcel.service'

@Module({
    controllers: [ ParcelController ],
    providers: [ ParcelService ]
})
export class ParcelModule {}
