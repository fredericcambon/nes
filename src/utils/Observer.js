class Observer {
    notify( t, e ) {
        throw ( new Error( "You need to overwrite notify" ) );
    }
}

export default Observer;
