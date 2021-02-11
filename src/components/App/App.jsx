import React from 'react';
import PropTypes from 'prop-types';
import AppRouter from 'components/AppRouter';
import RotateScreen from 'components/RotateScreen';
import 'styles/normalize.scss';
import styles from './App.scss';
import useBrowser from 'hooks/useBrowser';

const App = ({ routes }) => {
  const browser = useBrowser();

  if (RUNTIME_ENV === 'client') {
    console.info('browser', browser);
  }

  return (
    <>
      <RotateScreen />
      <div className={styles.app}>
        <AppRouter routes={routes} />
      </div>
    </>
  );
};

App.propTypes = {
  routes: PropTypes.array.isRequired,
};

export default App;
