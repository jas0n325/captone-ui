
export function getFormattedStoreName(name?: string, id?: string): string {
  let formattedStoreName: string;
  if (name) {
    formattedStoreName = name;
    if (id) {
      formattedStoreName = name + " (" + id + ")";
    }
  } else if (id) {
    formattedStoreName = id;
  }
  return formattedStoreName;
}
