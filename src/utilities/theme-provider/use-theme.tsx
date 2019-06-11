import {useContext} from 'react';
import ThemeContext from './context';

function useTheme() {
  const theme = useContext(ThemeContext);

  return theme;
}

export default useTheme;
