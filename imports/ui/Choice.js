import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

const Choice = (props) => {
    return (
        <div>
            <div>
                <h4>{props.choice.name}</h4>
                <p>Début : {moment(props.choice.startDate).format('D/M/Y HH:mm')} h</p>
                <p>Fin : {moment(props.choice.endDate).format('D/M/Y HH:mm')} h</p>
                <p>Lieu : {props.choice.place} - durée : {props.choice.duration} h</p>
            </div>
        </div>
    );
}

Choice.propTypes = {
    choice: PropTypes.object.isRequired
};

export default Choice;