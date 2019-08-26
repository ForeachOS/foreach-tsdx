import { CLIEngine } from 'eslint';
import { paths } from './constants';

export function createEslintInstance() {
  const cli = new CLIEngine({
    extensions: ['.ts', '.tsx'],
    baseConfig: {
      extends: [require.resolve('@foreachbe/eslint-config-react-app')],
    },
  });

  const formatter = cli.getFormatter();

  return () => {
    const report = cli.executeOnFiles([paths.appSrc]);
    console.log(formatter(report.results));
    return report;
  };
}
