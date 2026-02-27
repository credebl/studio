export interface IMemberInvitation {
    id:             string;
    email:          string;
    status:         string;
    type:           string;
    ecosystemId:    string;
    invitedOrg:     string;
    createDateTime: Date;
    ecosystem:      Ecosystem;
    user:           User;
    organisation:   Organisation;
}

export interface Ecosystem {
    id:              string;
    name:            string;
    description:     string;
    logoUrl:         null;
    autoEndorsement: boolean;
}

export interface Organisation {
    name: string;
}

export interface User {
    id:         string;
    firstName:  string;
    lastName:   string;
    email:      string;
    username:   string;
    profileImg: null;
}
