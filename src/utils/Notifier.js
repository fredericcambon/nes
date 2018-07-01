class Notifier {
  constructor() {
    this.observers = [];
  }

  addObserver(obs) {
    this.observers.push(obs);
  }

  removeObserver(obs) {
    this.observers = this.observers.filter(i => i !== obs);
  }

  notifyObservers(t, e) {
    this.observers.forEach(obs => obs.notify(t, e));
  }
}

export default Notifier;
