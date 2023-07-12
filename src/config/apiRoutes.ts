export const apiRoutes = {
    auth:{
        signUp: '/users',
        sinIn: '/users/login',
        verifyEmail:'/users/verify',
        userProfile: 'users/profile',
    },
    organizations: {
        create: '/organization',
        getAll: '/organization',
        getById: '/organization',
        agentSpinup: '/agent-service/spinup'
    }
}