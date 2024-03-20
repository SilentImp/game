class EventController {

    static dispatch(eventName, detail) {
        // console.log('dispatch', eventName, detail);
        const event = new CustomEvent(eventName, { detail });
        document.body.dispatchEvent(event);
    }

    static listenTo(eventName, eventHandler) {
        document.body.addEventListener(eventName, eventHandler);
    }
}

export default EventController;