import * as React from "react";

import {SpaAppHostProperties} from "./SpaAppHostProperties";

/**
 * A default SPA application host.
 *
 * @remarks
 * {DefaultSpaAppHost} is used when no host component type is specified during the rendering of
 * a Single Page Application (SPA). This class simply renders the scripts specified in the
 * {SpaAppHostProperties} object.
 */
export class DefaultSpaAppHost extends React.Component<SpaAppHostProperties, {}> {
    public render(): JSX.Element {
        return (
            <html>
                <head>
                    {this.props.headScriptPaths.map((scriptPath, idx) => <script key={idx} src={scriptPath}></script>)}
                </head>

                <body>
                    <div id="app"></div>
                    {this.props.applicationScriptPaths.map((scriptPath, idx) => <script key={idx} src={scriptPath}></script>)}
                </body>
            </html>
        );
    }
}