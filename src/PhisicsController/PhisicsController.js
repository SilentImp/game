class PhisicsController {
    static #ammo;

    constructor() {
        this.#init();
    }

    #init = async () => {
        PhisicsController.#ammo = await Ammo();
        const collisionConfiguration = new PhisicsController.#ammo.btDefaultCollisionConfiguration();
        const dispatcher = new PhisicsController.#ammo.btCollisionDispatcher( collisionConfiguration );
        const broadphase = new PhisicsController.#ammo.btDbvtBroadphase();
        const solver = new PhisicsController.#ammo.btSequentialImpulseConstraintSolver();
        const physicsWorld = new PhisicsController.#ammo.btDiscreteDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration );
        physicsWorld.setGravity( new PhisicsController.#ammo.btVector3( 0, 0, 0 ) );

    }
}

export default PhisicsController;