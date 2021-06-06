import path from 'path'
import fs from 'fs'
import xlsx from 'xlsx'
import _ from 'lodash'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { MyLogger } from '../_common/Logger.service'
import { ROOT_PATH } from '../../common/constants/index'


@Injectable()
export class ParcelService implements OnModuleInit {

    private readonly uploadDirPath = path.join(ROOT_PATH, './uploads')

    constructor(
        private readonly myLogger: MyLogger
    ) {}

    onModuleInit() {
        fs.stat(this.uploadDirPath, (err) => {
            if (!err) {
                return
            }
            fs.mkdir(this.uploadDirPath, (err) => {
                if (err) this.myLogger.error(JSON.stringify(err), 'FileService-onModuleInit')
            })
        })
    }

    async matchParcelCode(files: any) {
        const { orderList, parcelList } = files;
        const parcel = xlsx.read(parcelList[0].buffer, { type:'buffer' });
        const parcelSheetNames = parcel.SheetNames;
        const parcelWorksheet = parcel.Sheets[parcelSheetNames[0]];
        let parcelJson: any[] = xlsx.utils.sheet_to_json(parcelWorksheet);
        parcelJson = parcelJson.map((pj: any) => {
            const { parcelCode, company, province, city, region } = pj;
            const fullAddress = `${city}${region}`;
            const backupAddress = [province, city, region, `${province}${city}`, `${province}${region}`, `${city}${region}`];
            return {
                parcelCode,
                company,
                fullAddress,
                backupAddress,
            }
        });

        const order = xlsx.read(orderList[0].buffer, { type:'buffer' });
        const orderSheetNames = order.SheetNames;
        const orderWorksheet = order.Sheets[orderSheetNames[0]];
        let orderJson = xlsx.utils.sheet_to_json(orderWorksheet);
        orderJson = orderJson.map((oj: any) => {
            let parcelCode = '', company = '', lowerFlag = '';
            const { city = '', region = '' } = oj;
            const address = `${city}${region}`;
            const index = parcelJson.findIndex((parcel: any) => {
                if (address === parcel.fullAddress) {
                    console.log(address, parcel.fullAddress)
                    return true;
                }
                return false;
            });
            if (index !== -1) {
                company = parcelJson[index].company;
                parcelCode = parcelJson[index].parcelCode + '';
                parcelJson.splice(index, 1);
            }
            return {
                ...oj,
                company,
                parcelCode,
                lowerFlag,
            }
        }).map((oj: any) => {
            let parcelCode = '', company = '', lowerFlag = '';
            const { city = '', region = '' } = oj;
            if (oj.parcelCode) return oj;
            const index = parcelJson.findIndex((parcel: any) => {
                if (_.intersection([city, region], parcel.backupAddress).length >= 1) {
                    lowerFlag = 'Y';
                    return true;
                }
                return false;
            });
            if (index !== -1) {
                company = parcelJson[index].company;
                parcelCode = parcelJson[index].parcelCode + '';
                parcelJson.splice(index, 1);
            }
            return {
                ...oj,
                company,
                parcelCode,
                lowerFlag,
            }
        });

        let csvTitle = '订单号,省,市,区,快递号,快递公司,是否降级\n';
        orderJson.forEach((od: any) => {
            const { orderid, parcelCode, company, province, city, region, lowerFlag } = od;
            csvTitle = csvTitle + `${orderid},${province},${city},${region},${parcelCode},${company},${lowerFlag}\n`;
            csvTitle = csvTitle.replace(/undefined/g, '');
        })
        return {
            csvTitle
        };
    }

    // async fileUpload(files: any) {
    //     if (!files) {
    //         throw new HttpException('fileData Not Found', HttpStatus.INTERNAL_SERVER_ERROR)
    //     }

    //     const ext = file.originalname.split('.').pop() || ''

    //     if (!ext) {
    //         throw new HttpException('ext Not Found', HttpStatus.INTERNAL_SERVER_ERROR)
    //     }

    //     const md5Str = md5(file.buffer.toString('base64'))

    //     const fileName = `${md5Str}.${ext}`

    //     fs.writeFileSync(path.join(this.uploadDirPath, fileName), file.buffer)

    //     return {
    //         path: `${STATIC_PATH}/${fileName}`
    //     }

    // }

}
