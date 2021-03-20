var PropTypes = require('prop-types');
/* eslint-disable no-var */
/* TODO(csilvers): fix these lint errors (http://eslint.org/docs/rules): */
/* To fix, remove an entry above, run ka-lint, and fix errors. */

/**
 * This is a video widget for embedding videos in articles.
 */

var React = require("react");
var _ = require("underscore");

var Changeable = require("../mixins/changeable.jsx");
var FixedToResponsive = require("../components/fixed-to-responsive.jsx");

// Current default is 720p, based on the typical videos we upload currently
var DEFAULT_WIDTH = 1280;
var DEFAULT_HEIGHT = 720;

var YT_EMBED =
    "https://www.youtube.com/embed/{slug}" + "?modestbranding=1&rel=0";
var IS_URL = /^https?:\/\//;

/**
 * Video renderer.
 */
class Video extends React.Component {
    static propTypes = {
        ...Changeable.propTypes,
        alignment: PropTypes.string,
        location: PropTypes.string,
    }

    getUserInput() {
        return null;
    }

    simpleValidate(rubric) {
        return Video.validate(null, rubric);
    }

    change(...args) {
        return Changeable.change.apply(this, args);
    }

    render() {
        var location = this.props.location;
        if (!location) {
            return <div />;
        }

        var url;

        if (IS_URL.test(location)) {
            url = location;
        } else {
            url = YT_EMBED.replace("{slug}", location);
        }

        return (
            <FixedToResponsive // @Nolint this is fine, the linter is wrong
                width={DEFAULT_WIDTH}
                height={DEFAULT_HEIGHT}
                // The key is here for the benefit of the editor, to ensure that
                // any changes cause a re-rendering of the frame.
                key={location + this.props.alignment}
            >
                <iframe
                    className="perseus-video-widget"
                    sandbox="allow-same-origin allow-scripts"
                    width={DEFAULT_WIDTH}
                    height={DEFAULT_HEIGHT}
                    src={url}
                    allowFullScreen={true}
                />
            </FixedToResponsive>
        );
    }
}

/**
 * This is the widget's grading function.
 * Points for videos are tallied by the embedded video itself, in the case
 * of Khan Academy videos.
 */
_.extend(Video, {
    validate(state, rubric) {
        return {
            type: "points",
            earned: 0,
            total: 0,
            message: null,
        };
    },
});

module.exports = {
    name: "video",
    displayName: "Video",
    defaultAlignment: "block",
    supportedAlignments: ["block", "float-left", "float-right", "full-width"],
    widget: Video,
};
