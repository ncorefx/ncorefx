import * as React from "react";

import {SpaAppHostProperties} from "./SpaAppHostProperties";

export class DefaultSpaAppHost extends React.Component<SpaAppHostProperties, {}> {
    public render(): JSX.Element {
        return (
            <html>
                <head>
                    <script src="./node_modules/systemjs/dist/system.js"></script>
                </head>

                <body>
                    <div id="app"></div>
                    { this.props.scriptPaths.map((scriptPath, idx) => <script key={idx} src={scriptPath}></script>) }
                </body>
            </html>
        );
    }
}