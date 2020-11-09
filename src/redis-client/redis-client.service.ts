import {Injectable} from '@nestjs/common';
import {RedisService} from 'nestjs-redis';
import * as Redis from 'ioredis';


@Injectable()
export class RedisClientService {
    private _client: Redis.Redis
    constructor(private readonly redisService: RedisService) {
        this._client = this.redisService.getClient('main');
    }

    async getClient(): Promise<Redis.Redis> {
        const client = this.redisService.getClient('main');
        return client;
    }

    async setValue(
        key: string,
        value: string,
        expiryMode?: string | any[],
        time?: number | string,
    ): Promise<boolean> {
        let result;
        if (expiryMode && time) {
            result = await this._client.set(key, value, expiryMode, time);
        } else if (expiryMode) {
            result = await this._client.set(key, value, expiryMode);
        } else
            result = await this._client.set(key, value);
        return result == 'OK';
    }

    //Hashes Commamds
    async addInHash(key: string, sKey: string, value: string): Promise<boolean> {
        const result = await this._client.hmset(key, {[sKey]: value})
        return result == 'OK';
    }

    async getFromHash(key: string, sKey: string): Promise<string> {
        return await this._client.hget(key, sKey)
    }

    async delFromHash(key: string, sKey: string): Promise<number> {
        return await this._client.hdel(key, sKey)
    }

    // List Commands
    async lPush(key: string, ...value: string[]): Promise<number> {
        let result = await this._client.lpush(key, ...value)
        return result;
    }

    async

    async removeFromList(key: string, value: string) {
        this._client.lrem(key, 0, value)
    }

    async getValue(key: string): Promise<string> {
        const result = await this._client.get(key);
        return result;
    }
}
