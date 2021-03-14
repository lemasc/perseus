const PropTypes = require('prop-types');
const React = require("react");
const _ = require("underscore");

const Changeable = require("../mixins/changeable.jsx");
const EditorJsonify = require("../mixins/editor-jsonify.jsx");

const Editor = require("../editor.jsx");
const TextInput = require("../components/text-input.jsx");

class DefinitionEditor extends React.Component {
    static propTypes = {
        ...Changeable.propTypes,
        togglePrompt: PropTypes.string,
        definition: PropTypes.string,
        apiOptions: PropTypes.any,
    }

    static defaultProps = {
            togglePrompt: "",
            definition: "",
    };

    change(...args) {
        return Changeable.change.apply(this, args);
    }

    serialize() {
        return EditorJsonify.serialize.call(this);
    }

    render() {
        return (
            <div className="perseus-widget-definition-editor">
                <div className="perseus-widget-row">
                    <label>
                        Word to be defined:{" "}
                        <TextInput
                            value={this.props.togglePrompt}
                            onChange={this.change("togglePrompt")}
                            placeholder="define me"
                        />
                    </label>
                </div>
                <div className="perseus-widget-row">
                    <Editor
                        apiOptions={this.props.apiOptions}
                        content={this.props.definition}
                        widgetEnabled={false}
                        placeholder="definition goes here"
                        onChange={props => {
                            const newProps = {};
                            if (_.has(props, "content")) {
                                newProps.definition = props.content;
                            }
                            this.change(newProps);
                        }}
                    />
                </div>
            </div>
        );
    }
}

module.exports = DefinitionEditor;
