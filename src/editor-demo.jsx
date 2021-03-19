const PropTypes = require('prop-types');
/**
  * Demonstrates the main Perseus editor
  *
  * This is ran by demo-perseus.js and handles adding debugger
  * buttons and their event listeners above a StatefulEditorPage
  */

const React = require("react");
const StatefulEditorPage = require("./stateful-editor-page.jsx");
const EditorPage = require("./editor-page.jsx");
const Util = require("./util.js");
const Renderability = require("./renderability.jsx");


class EditorDemo extends React.Component {
    static propTypes = {
        problemNum: PropTypes.number,
        question: PropTypes.any.isRequired,
    }
    static defaultProps = {
        question: {
            question: {
                content: "",
                images: {},
                widgets: {}
            },
            answerArea: {
                calculator: false,
            },
            itemDataVersion: {
                major: 0,
                minor: 1,
            },
            hints: [],
        },
        problemNum: 1
    }

    constructor(props) {
        super(props);
        this.state = {
            deviceType: "desktop",
            scratchpadEnabled: true,
        };
        this.editor = React.createRef();
    }

    componentDidMount = () => {
        // Hacks to make debugging nicer
        window.editorPage = this.editor.current.refs.editor;
        //window.itemRenderer = window.editorPage.renderer;
    }

    serialize = () => {
        console.log(JSON.stringify(this.editor.current.serialize(), null, 4)); // eslint-disable-line no-console
    }

    scorePreview = () => {
        console.log(this.editor.current.scorePreview()); // eslint-disable-line no-console
    }

    _getContentHash = () => {
        return Util.strongEncodeURIComponent(
            JSON.stringify(this.editor.current.serialize())
        );
    }

    permalink = (e) => {
        window.location.hash = `content=${this._getContentHash()}`;
        e.preventDefault();
    }

    viewRendered = (e) => {
        const link = document.createElement("a");
        link.href =
            window.location.pathname +
            `?renderer#content=${this._getContentHash()}`;
        link.target = "_blank";
        link.click();
        e.preventDefault();
    }

    inputVersion = (e) => {
        e.preventDefault();
        // print whether or not this item consists only of
        // input-numbers and numeric-inputs.
        // just for versioning testing
        console.log( // eslint-disable-line no-console
            Renderability.isItemRenderableByVersion(
                this.editor.current.serialize(),
                {
                    "::renderer::": {major: 100, minor: 0},
                    group: {major: 100, minor: 0},
                    sequence: {major: 100, minor: 0},
                    "input-number": {major: 100, minor: 0},
                    "numeric-input": {major: 100, minor: 0}
                }
            )
        );
    }

    saveWarnings = (e) => {
        e.preventDefault();
        console.log(this.editor.current.getSaveWarnings()); // eslint-disable-line no-console
    }

    getEditorProps = () => {
        const {deviceType} = this.state;
        const isMobile = deviceType === "phone" || deviceType === "tablet";

        return {
            ...this.props.question,
            problemNum: this.props.problemNum,
            developerMode: true,
            imageUploader(image, callback) {
                setTimeout(
                    callback,
                    1000,
                    "https://cdn.kastatic.org/images/khan-logo-vertical-transparent.png"
                ); // eslint-disable-line max-len
            },
            apiOptions: {
                onFocusChange(newPath, oldPath) {
                    console.log("onFocusChange", newPath, oldPath); // eslint-disable-line no-console
                },
                customKeypad: isMobile,
                isMobile,
                setDrawingAreaAvailable: enabled => {
                    this.setState({
                        scratchpadEnabled: enabled,
                    });
                }
            },
            componentClass: EditorPage,
            onPreviewDeviceChange: deviceType => {
                this.setState({deviceType});
            },
            previewDevice: deviceType
        };
    }

    render() {
        const editorProps = this.getEditorProps();

        return (
            <div id="perseus-index">
                <div className="extras">
                    <button onClick={this.serialize}>serialize</button>{" "}
                    <button onClick={this.scorePreview}>score</button>{" "}
                    <button onClick={this.permalink}>permalink</button>{" "}
                    <button onClick={this.viewRendered}>
                        view rendered
                    </button>{" "}
                    <button onClick={this.inputVersion}>
                        contains only inputs?
                    </button>{" "}
                    <button onClick={this.saveWarnings}>
                        save warnings
                    </button>{" "}
                    <span>Seed:{this.props.problemNum} </span>{" "}
                    <span>
                        Scratchpad:{this.state.scratchpadEnabled
                            ? "enabled"
                            : "disabled"}
                    </span>
                </div>
                <StatefulEditorPage
                    key={this.props.question}
                    ref={this.editor}
                    {...editorProps}
                />
            </div>
        );
    }
}

module.exports = EditorDemo;
