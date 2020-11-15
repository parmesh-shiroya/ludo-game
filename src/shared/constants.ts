export enum ROOM_TYPE {
    ONLINE_TWO = "ONLINE_TWO",
    ONLINE_FOUR = "ONLINE_FOUR"
}

export const ROOM_SIZE: Record<ROOM_TYPE, number> = {
    [ROOM_TYPE.ONLINE_TWO]: 2,
    [ROOM_TYPE.ONLINE_FOUR]: 4,
}

export enum LOGIN_TYPE {
    GUEST = "GUEST"
}

export enum ROOM_FEE_TYPE {
    FEE_500 = "FEE_500",
    FEE_1500 = "FEE_1500",
    FEE_5000 = "FEE_5000"
}

export const ROOM_FEE: Record<ROOM_FEE_TYPE, {fee: number, prize1: number}> = {
    [ROOM_FEE_TYPE.FEE_500]: {
        fee: 500,
        prize1: 950,
    },
    [ROOM_FEE_TYPE.FEE_1500]: {
        fee: 1500,
        prize1: 950,
    },
    [ROOM_FEE_TYPE.FEE_5000]: {
        fee: 5000,
        prize1: 9500
    }
}

export enum PLAYER_STATUS {
    ONLINE = "ONLINE",
    OFFLINE = "OFFLINE"
}