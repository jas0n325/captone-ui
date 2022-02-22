
export interface DatabaseState {
  db?: any;
}

const INITIAL_STATE: DatabaseState = { };

export default (state: DatabaseState = INITIAL_STATE, action: any): DatabaseState => {
  return state;
};
