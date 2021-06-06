import { Module } from '@nestjs/common'
import { ParcelModule } from './parcel/parcel.module'


@Module({
    imports: [
        ParcelModule
    ]
})
export class FeatureModule {}
