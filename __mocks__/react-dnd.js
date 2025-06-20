const noop = () => {};

module.exports = {
  DndProvider: ({ children }) => children,
  useDrag: () => [
    { isDragging: false },
    noop,
  ],
  useDrop: () => [
    { isOver: false },
    noop,
  ],
};
