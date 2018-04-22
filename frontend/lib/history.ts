import { createBrowserHistory, createHashHistory } from "history";

// this will have problem on GitHub pages because of the basename.
// export default createBrowserHistory();

export default createHashHistory();
