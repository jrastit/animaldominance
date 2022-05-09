import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export default function DragHelper(props : {
  onPointerDown ?: any
  onPointerUp ?: any
  onPointerMove ?: any
  onDragMove ?: any
  children ?: any
  style ?: any
  className ?: any
}) {
  const {
    onPointerDown,
    onPointerUp,
    onPointerMove,
    onDragMove,
    children,
    style,
    className,
  } = props;

  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (e : any) => {
    setIsDragging(true);

    onPointerDown(e);
  };

  const handlePointerUp = (e : any) => {
    setIsDragging(false);

    onPointerUp(e);
  };

  const handlePointerMove = (e : any) => {
    if (isDragging) onDragMove(e);

    onPointerMove(e);
  };

  useEffect(() => {
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
    }
  }, []);

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      style={style}
      className={className}
    >
      {children}
    </div>
  );
}

const { func, element, shape, bool, string } = PropTypes;

DragHelper.propTypes = {
  onDragMove: func.isRequired,
  onPointerDown: func,
  onPointerUp: func,
  onPointerMove: func,
  children: element,
  style: shape({}),
  className: string,
}

DragHelper.defaultProps = {
  onPointerDown: () => {},
  onPointerUp: () => {},
  onPointerMove: () => {},
};
