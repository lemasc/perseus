const PropTypes = require('prop-types');
/* eslint-disable no-var, object-curly-spacing, react/prop-types, react/sort-comp */
/* TODO(csilvers): fix these lint errors (http://eslint.org/docs/rules): */
/* To fix, remove an entry above, run ka-lint, and fix errors. */

var React = require("react");
var _ = require("underscore");

var ApiOptions = require("./perseus-api.jsx").Options;
var Editor = require("./editor.jsx");
var ItemExtrasEditor = require("./item-extras-editor.jsx");
var DeviceFramer = require("./components/device-framer.jsx");
var ITEM_DATA_VERSION = require("./version.json").itemDataVersion;
const IframeContentRenderer = require("./iframe-content-renderer.jsx");

class ItemEditor extends React.Component {
    constructor(props) {
        super(props);
        this.handleEditorChange = this.handleEditorChange.bind(this);
    }

    static propTypes = {
        apiOptions: ApiOptions.propTypes,
        deviceType: PropTypes.string,
        gradeMessage: PropTypes.string,
        imageUploader: PropTypes.func,
        wasAnswered: PropTypes.bool,
    }
    static defaultProps = {
        onChange: () => {},
        question: {},
        answerArea: {},
    };

    // Notify the parent that the question or answer area has been updated.
    updateProps(newProps, cb, silent) {
        var props = _.pick(this.props,"question", "answerArea");
        this.props.onChange(_.extend(props,newProps), cb, silent);
    }

    render() {
        const isMobile =
            this.props.deviceType === "phone" ||
            this.props.deviceType === "tablet";
        return (
            <div className="perseus-editor-table">
                <div className="perseus-editor-row perseus-question-container">
                    <div className="perseus-editor-left-cell">
                        <div className="pod-title">Question</div>
                        <Editor
                            ref="questionEditor"
                            placeholder="Type your question here..."
                            className="perseus-question-editor"
                            imageUploader={this.props.imageUploader}
                            onChange={this.handleEditorChange}
                            apiOptions={this.props.apiOptions}
                            showWordCount={true}
                            {...this.props.question}
                        />
                    </div>

                    <div className="perseus-editor-right-cell">
                        <div id="problemarea">
                            <DeviceFramer
                                deviceType={this.props.deviceType}
                                nochrome={true}
                            >
                                <IframeContentRenderer
                                    ref="frame"
                                    key={this.props.deviceType}
                                    datasetKey="mobile"
                                    datasetValue={isMobile}
                                    seamless={true}
                                />
                            </DeviceFramer>
                            <div
                                id="hintsarea"
                                className="hintsarea"
                                style={{display: "none"}}
                            />
                        </div>
                    </div>
                </div>

                <div className="perseus-editor-row perseus-answer-container">
                    <div className="perseus-editor-left-cell">
                        <div className="pod-title">Question extras</div>
                        <ItemExtrasEditor
                            ref="itemExtrasEditor"
                            onChange={this.handleItemExtrasChange}
                            {...this.props.answerArea}
                        />
                    </div>

                    <div className="perseus-editor-right-cell">
                        <div id="answer_area" />
                    </div>
                </div>
            </div>
        );
    }

    triggerPreviewUpdate(newData) {
        this.refs.frame.sendNewData(newData);
    }

    handleEditorChange = (newProps, cb, silent) => {
        var question = _.extend(this.props.question, newProps);
        this.updateProps({question}, cb, silent);
    }

    handleItemExtrasChange = (newProps, cb, silent) => {
        var answerArea = _.extend({}, this.props.answerArea, newProps);
        this.updateProps({answerArea}, cb, silent);
    }

    getSaveWarnings() {
        return this.refs.questionEditor.getSaveWarnings();
    }

    serialize(options) {
        return {
            question: this.refs.questionEditor.serialize(options),
            answerArea: this.refs.itemExtrasEditor.serialize(options),
            itemDataVersion: ITEM_DATA_VERSION,
        };
    }

    focus() {
        this.questionEditor.focus();
    }
}

module.exports = ItemEditor;
