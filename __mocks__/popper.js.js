const PopperJS = jest.requireActual('popper.js');

// Workaround to issue of not being able to simulate user user actions of clicking the dropdown menu
// and then a dropdown item per (reactstrap uses popper.js) https://github.com/FezVrasta/popper.js/issues/478

export default class {
  static placements = PopperJS.placements;

  constructor() {
    return {
      destroy: () => {},
      scheduleUpdate: () => {}
    };
  }
};
