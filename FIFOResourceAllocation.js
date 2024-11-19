let deviceConsumptionLimit = 40;

class PowerSupplySystem {
  constructor(totalPower, maxPower) {
    this.totalPower = totalPower;
    this.maxPower = maxPower;
    this.queue = [];
    this.time = 0;
  }

  consumePower(deviceId, requestedPower) {
    if (requestedPower > deviceConsumptionLimit) {
      console.log(
        `Error: Device ${deviceId} cannot request more than ${deviceConsumptionLimit} units.`
      );
      return;
    }

    let allocatedPower =
      requestedPower <= this.maxPower ? requestedPower : this.maxPower;

    this.queue.push({
      deviceId,
      requestedPower,
      allocatedPower,
      time: `T${this.time++}`,
    });

    this.maxPower -= allocatedPower;

    console.log(
      `Device ${deviceId} connected, allocated ${allocatedPower} units (requested: ${requestedPower}). Remaining power: ${this.maxPower} units.`
    );
    this.displayState();
  }

  changeConsumption(deviceId, change) {
    for (let device of this.queue) {
      if (device.deviceId === deviceId) {
        let newConsumption = device.allocatedPower + change;

        if (newConsumption < 0 || newConsumption > deviceConsumptionLimit) {
          console.log(
            `Error: Device ${deviceId}'s consumption cannot be adjusted to ${newConsumption} units.`
          );
          return;
        }

        if (change > 0 && change > this.maxPower) {
          console.log(
            `Error: Not enough power available to increase consumption for Device ${deviceId}.`
          );
          return;
        }
        if (change < 0) {
          device.requestedPower =
            device.allocatedPower === device.requestedPower
              ? 0
              : device.requestedPower;

          device.allocatedPower = newConsumption;
          this.maxPower -= change;
        }
        if (change > 0) {
          device.allocatedPower = newConsumption;

          device.requestedPower =
            device.allocatedPower === device.requestedPower
              ? 0
              : device.requestedPower;

          this.maxPower -= change;
        }

        console.log(
          `Device ${deviceId}'s consumption adjusted to ${newConsumption} units. Remaining power: ${this.maxPower} units.`
        );
        this.reallocatePower();
        this.displayState();
        return;
      }
    }

    console.log(`Error: Device ${deviceId} not found.`);
  }

  disconnect(deviceId) {
    let index = this.queue.findIndex((device) => device.deviceId === deviceId);

    if (index === -1) {
      console.log(`Error: Device ${deviceId} not found.`);
      return;
    }

    let releasedPower = this.queue[index].allocatedPower;
    this.maxPower += releasedPower;
    console.log(
      `Device ${deviceId} disconnected, released ${releasedPower} units. Remaining power: ${this.maxPower} units.`
    );

    this.queue.splice(index, 1);

    this.reallocatePower();
    this.displayState();
  }

  reallocatePower() {
    for (let device of this.queue) {
      let additionalPower =
        device.requestedPower - device.allocatedPower <= this.maxPower
          ? device.requestedPower - device.allocatedPower
          : this.maxPower;

      if (additionalPower > 0) {
        device.allocatedPower += additionalPower;
        this.maxPower -= additionalPower;
        console.log(
          `Device ${device.deviceId} received additional ${additionalPower} units.`
        );
      }
    }
  }

  displayState() {
    console.log("\n--- Current Power Allocation ---");
    this.queue.forEach((device) => {
      console.log(
        `Device ${device.deviceId}: Allocated ${device.allocatedPower} units (requested: ${device.requestedPower}).`
      );
    });
    console.log(`Remaining power: ${this.maxPower} units.\n`);
  }
}

const powerSystem = new PowerSupplySystem(100, 92);

powerSystem.consumePower("A", 40);
powerSystem.consumePower("B", 40);
powerSystem.consumePower("C", 30);
powerSystem.disconnect("A");
powerSystem.consumePower("D", 40);
powerSystem.changeConsumption("B", -20);
