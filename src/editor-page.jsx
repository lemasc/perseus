const PropTypes = require('prop-types');
/* eslint-disable no-var, react/sort-comp */
/* TODO(csilvers): fix these lint errors (http://eslint.org/docs/rules): */
/* To fix, remove an entry above, run ka-lint, and fix errors. */

var React = require("react");
var _ = require("underscore");

const ApiClassNames = require("./perseus-api.jsx").ClassNames;
const ApiOptionsProps = require("./mixins/api-options-props.js");
var CombinedHintsEditor = require("./hint-editor.jsx");
var FixPassageRefs = require("./util/fix-passage-refs.jsx");
var ItemEditor = require("./item-editor.jsx");
var JsonEditor = require("./json-editor.jsx");
var ViewportResizer = require("./components/viewport-resizer.jsx");
const HUD = require("./components/hud.jsx");

class EditorPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            json: _.pick(
                this.props,
                "question",
                "answerArea",
                "hints",
                "itemDataVersion"
            ),
            gradeMessage: "",
            wasAnswered: false,
            highlightLint: true,
        };
        this.handleChange = this.handleChange.bind(this);
        this.itemEditor = React.createRef();
        this.hintsEditor = React.createRef();
    }

    static propTypes = {
        ...ApiOptionsProps.propTypes,

        answerArea: PropTypes.any, // related to the question

        developerMode: PropTypes.bool,

        // Source HTML for the iframe to render
        frameSource: PropTypes.string.isRequired,

        hints: PropTypes.any, // related to the question

        // A function which takes a file object (guaranteed to be an image) and
        // a callback, then calls the callback with the url where the image
        // will be hosted. Image drag and drop is disabled when imageUploader
        // is null.
        imageUploader: PropTypes.func,

        // Part of the question
        itemDataVersion: PropTypes.shape({
            major: PropTypes.number,
            minor: PropTypes.number,
        }),

        // Whether the question is displaying as JSON or if it is
        // showing the editor itself with the rendering
        jsonMode: PropTypes.bool,

        // A function which is called with the new JSON blob of content
        onChange: PropTypes.func,

        onPreviewDeviceChange: PropTypes.func,
        previewDevice: PropTypes.string,

        // Initial value of the question being edited
        question: PropTypes.any,
    }
    
    static defaultProps = {
        developerMode: false,
        jsonMode: false,
        onChange: () => {},
    };

    handleCheckAnswer = () => {
        var result = this.scorePreview();
        this.setState({
            gradeMessage: result.message,
            wasAnswered: result.correct,
        });
    }

    toggleJsonMode = () => {
        this.setState(
            {
                json: this.serialize({keepDeletedWidgets: true}),
            },
            function() {
                this.props.onChange({
                    jsonMode: !this.props.jsonMode,
                });
            }
        );
    }

    componentDidMount() {
        this._isMounted = true;
        this.rendererMountNode = document.createElement("div");
        this.updateRenderer();
    }

    componentDidUpdate() {
        this.updateRenderer();
    }
    componentWillUnmount() {
        this._isMounted = false;
    }

    updateRenderer = () => {
        // Some widgets (namely the image widget) like to call onChange before
        // anything has actually been mounted, which causes problems here. We
        // just ensure don't update until we've mounted
        const hasEditor = !this.props.developerMode || !this.props.jsonMode;
        if (!this._isMounted || !hasEditor) {
            return;
        }

        const touch =
            this.props.previewDevice === "phone" ||
            this.props.previewDevice === "tablet";
        const deviceBasedApiOptions = Object.assign(this.getApiOptions(), {
            customKeypad: touch,
            isMobile: touch,
        });

        this.itemEditor.current.triggerPreviewUpdate({
            type: "question",
            data: _.extend(
                {
                item: this.serialize(),
                apiOptions: deviceBasedApiOptions,
                initialHintsVisible: 0,
                device: this.props.previewDevice,
                linterContext: {
                    contentType: "exercise",
                    highlightLint: this.state.highlightLint,
                    paths: this.props.contentPaths,
                },
                reviewMode: true,
                legacyPerseusLint: this.itemEditor.current.getSaveWarnings(),
            },
                _.pick(this.props,
                    "workAreaSelector",
                    "solutionAreaSelector",
                    "hintsAreaSelector",
                    "problemNum"
                )
            ),
        });
    }

    getApiOptions() {
        return ApiOptionsProps.getApiOptions.call(this);
    }

    handleChange = (toChange, cb, silent) => {
        var newProps = _.pick(this.props,"question", "hints", "answerArea");
        _.extend(newProps,toChange);
        this.props.onChange(newProps, cb, silent);
    }

    changeJSON = (newJson) => {
        this.setState({
            json: newJson,
        });
        this.props.onChange(newJson);
    }

    _fixPassageRefs = () => {
        var itemData = this.serialize();
        var newItemData = FixPassageRefs(itemData);
        this.setState({
            json: newItemData,
        });
        this.props.onChange(newItemData);
    }

    scorePreview = () => {
        if (this.renderer) {
            return this.renderer.scoreInput();
        } else {
            return null;
        }
    }

    render() {
        let className = "framework-perseus";

        const touch =
            this.props.previewDevice === "phone" ||
            this.props.previewDevice === "tablet";
        const deviceBasedApiOptions = Object.assign(this.getApiOptions(), {
            customKeypad: touch,
            isMobile: touch,
        });

        if (deviceBasedApiOptions.isMobile) {
            className += " " + ApiClassNames.MOBILE;
        }

        return (
            <div id="perseus" className={className}>
                <div style={{marginBottom: 10}}>
                    {this.props.developerMode &&
                        <span>
                            <label>
                                {" "}Developer JSON Mode:{" "}
                                <input
                                    type="checkbox"
                                    checked={this.props.jsonMode}
                                    onChange={this.toggleJsonMode}
                                />
                            </label>{" "}
                            <button
                                type="button"
                                onClick={this._fixPassageRefs}
                            >
                                Fix passage-refs
                            </button>{" "}
                        </span>}

                    {!this.props.jsonMode &&
                        <ViewportResizer
                            deviceType={this.props.previewDevice}
                            onViewportSizeChanged={
                                this.props.onPreviewDeviceChange
                            }
                        />}

                    {!this.props.jsonMode &&
                        <HUD
                            message="Style warnings"
                            enabled={this.state.highlightLint}
                            onClick={() => {
                                this.setState({
                                    highlightLint: !this.state.highlightLint,
                                });
                            }}
                        />}
                </div>

                {this.props.developerMode &&
                    this.props.jsonMode &&
                    <div>
                        <JsonEditor
                            multiLine={true}
                            value={this.state.json}
                            onChange={this.changeJSON}
                        />
                    </div>}

                {(!this.props.developerMode || !this.props.jsonMode) &&
                    <ItemEditor
                        ref={this.itemEditor}
                        rendererOnly={this.props.jsonMode}
                        question={this.props.question}
                        answerArea={this.props.answerArea}
                        imageUploader={this.props.imageUploader}
                        onChange={this.handleChange}
                        wasAnswered={this.state.wasAnswered}
                        gradeMessage={this.state.gradeMessage}
                        onCheckAnswer={this.handleCheckAnswer}
                        deviceType={this.props.previewDevice}
                        apiOptions={deviceBasedApiOptions}
                        frameSource={this.props.frameSource}
                    />}

                {(!this.props.developerMode || !this.props.jsonMode) &&
                    <CombinedHintsEditor
                        ref={this.hintsEditor}
                        hints={this.props.hints}
                        imageUploader={this.props.imageUploader}
                        onChange={this.handleChange}
                        deviceType={this.props.previewDevice}
                        apiOptions={deviceBasedApiOptions}
                        frameSource={this.props.frameSource}
                        highlightLint={this.state.highlightLint}
                    />}
            </div>
        );
    }

    getSaveWarnings = () => {
        var issues1 = this.itemEditor.current.getSaveWarnings();
        var issues2 = this.hintsEditor.current.getSaveWarnings();
        return issues1.concat(issues2);
    }

    serialize = (options) => {
        if (this.props.jsonMode) {
            return this.state.json;
        } else {
            return _.extend(this.itemEditor.current.serialize(options), {
                hints: this.hintsEditor.current.serialize(options),
            });
        }
    }
}

module.exports = EditorPage;
