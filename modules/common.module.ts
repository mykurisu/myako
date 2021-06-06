import { Module, Global, HttpModule } from '@nestjs/common'
import { Cache } from './_common/Cache.service'
import { MyLogger } from './_common/Logger.service'


@Global()
@Module({
    imports: [ HttpModule ],
    providers: [ Cache, MyLogger ],
    exports: [ Cache, MyLogger ]
})
export class CommonModule {}
