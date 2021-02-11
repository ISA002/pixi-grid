import Home from 'pages/Home';

export default [
  {
    path: '/',
    exact: true,
    cache: false,
    component: Home,
    sagasToRun: [],
    title: 'Home',
  },
];
