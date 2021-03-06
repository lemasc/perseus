const PropTypes = require('prop-types');
/* eslint-disable comma-dangle, no-var, react/forbid-prop-types, react/jsx-closing-bracket-location, react/sort-comp */
/* TODO(csilvers): fix these lint errors (http://eslint.org/docs/rules): */
/* To fix, remove an entry above, run ka-lint, and fix errors. */

const React = require("react");
const _ = require("underscore");

const ApiOptions = require("../perseus-api.jsx").Options;
const Changeable = require("../mixins/changeable.jsx");

const Editor = require("../editor.jsx");

class GroupEditor extends React.Component {
    static propTypes = {
        ...Changeable.propTypes,
        content: PropTypes.string,
        widgets: PropTypes.object,
        images: PropTypes.object,
        metadata: PropTypes.any,
        apiOptions: ApiOptions.propTypes,
    }

    static defaultProps = {
            content: "",
            widgets: {},
            images: {},
            // `undefined` instead of `null` so that getDefaultProps works for
            // `the GroupMetadataEditor`
            metadata: undefined,
        };

    render() {
        return (
            <div className="perseus-group-editor">
                <div>
                    {/* the metadata editor; used for tags on
                    khanacademy.org */}
                    {this._renderMetadataEditor()}
                </div>
                <Editor
                    ref="editor"
                    content={this.props.content}
                    widgets={this.props.widgets}
                    apiOptions={this.props.apiOptions}
                    images={this.props.images}
                    widgetEnabled={true}
                    immutableWidgets={false}
                    onChange={this.props.onChange}
                />
            </div>
        );
    }

    _renderMetadataEditor = () => {
        var GroupMetadataEditor = this.props.apiOptions.GroupMetadataEditor;
        return (
            <GroupMetadataEditor
                value={this.props.metadata}
                onChange={this.change("metadata")}
            />
        );
    }

    change(...args) {
        return Changeable.change.apply(this, args);
    }

    getSaveWarnings = () => {
        return this.refs.editor.getSaveWarnings();
    }

    serialize = () => {
        return _.extend({}, this.refs.editor.serialize(), {
            metadata: this.props.metadata,
        });
    }
}

module.exports = GroupEditor;
