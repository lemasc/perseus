const PropTypes = require('prop-types');
/* eslint-disable no-var */
/* TODO(csilvers): fix these lint errors (http://eslint.org/docs/rules): */
/* To fix, remove an entry above, run ka-lint, and fix errors. */

const React = require("react");
const _ = require("underscore");

const Changeable = require("../mixins/changeable.jsx");
const EditorJsonify = require("../mixins/editor-jsonify.jsx");

const InfoTip = require("../components/info-tip.jsx");
const BlurInput = require("react-components/blur-input.jsx");

/**
 * This is the main editor for this widget, to specify all the options.
 */
class VideoEditor extends React.Component {
    static propTypes = {
        ...Changeable.propTypes,
        location: PropTypes.string,
        onChange: PropTypes.func,
    }

    static defaultProps = {
        location: ""
    }

    /**
     * Add built-in support to Youtube embed videos.
     */
     formatUrl(url) {
        try {
            let video = new URL(url);
            if((/youtu\.be/).test(video.hostname)) {
                // Youtube short link; grab the id immediately
                return video.pathname.slice(1);
            }
            if((/youtube\.com/).test(video.hostname)) {
                // Youtube normal link
                if(video.searchParams.has("v")) {
                    return video.searchParams.get("v");
                }
            }
            return url;
        }
        catch (e) {
            console.error(e);
            return url;

        }
    }
    
    _handleUrlChange = (url) => {
        this.props.onChange({ location: this.formatUrl(url) });
    }

    change(...args) {
        return Changeable.change.apply(this, args);
    }

    serialize() {
        return EditorJsonify.serialize.call(this);
    }

    render() {
        return (
            <div>
                <label>
                    URL or YT Video ID:{" "}
                    <BlurInput
                        name="location"
                        value={this.props.location}
                        onChange={this._handleUrlChange}
                    />
                    <InfoTip>
                        You can paste any URL here. Youtube video URLs will be
                        converted to the proper format automatically.
                    </InfoTip>
                </label>
            </div>
        );
    }
}

module.exports = VideoEditor;
