import React from 'react';
import Scene from './Scene';
import style from './Home.scss';
import images from './images';

const Home = () => {
  const ref = React.useRef();

  React.useEffect(() => {
    const scene = new Scene(ref.current, images);

    return () => {
      scene.destroyListener();
    };
  }, [ref]);

  return (
    <div className={style.root}>
      <div className={style.container}>
        <div className={style.imageWrapper} ref={ref} />
      </div>
    </div>
  );
};

export default Home;
