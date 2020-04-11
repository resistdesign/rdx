import Path from 'path';

const CONTENTS = Path.join(__dirname, 'test-content');
const TEST_APP = Path.join(CONTENTS, 'test-app');

export const TEST_DIRECTORIES = {
  CONTENTS,
  TEST_APP
};

export default TEST_DIRECTORIES;
