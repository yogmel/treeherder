import React from 'react';
import PropTypes from 'prop-types';
import {
  Form,
  FormGroup,
  Input,
  Label,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Col,
  Row,
} from 'reactstrap';

import { update } from '../../helpers/http';
import { getApiUrl } from '../../helpers/url';
import { endpoints } from '../constants';

export default class NotesModal extends React.Component {
  constructor(props) {
    super(props);
    this.issueTrackers = this.props.issueTrackers;
    this.state = {
      inputValue: '',
      failureMessage: '',
    };
  }

  updateInput = event => {
    this.setState(
      { inputValue: event.target.value }
    );
  };

  editNotes = async event => {
    event.preventDefault();
    
    const { alertSummary } = this.props;    
    const { data, failureStatus } = await update(
      getApiUrl(`${endpoints.alertSummary}${alertSummary.id}/`),
      {
        notes: alertSummary.notes
      },
    );
    console.log(data);
    // TODO show error message
    // controller is making a copy of alertSummary before modifying. why?
    // if (!failureStatus) {
    //   alertSummary.originalNotes = alertSummary.notes;
    //   alertSummary.notesChanged = false;
    // }
  }

  render() {
    const { showModal, toggle } = this.props;
    const {
      inputValue,
      failureMessage,
    } = this.state;

    return (
      <Modal isOpen={showModal} className="">
        <ModalHeader toggle={toggle}>Alert Notes</ModalHeader>
        <Form>
          <ModalBody>
            <FormGroup>
              <Label for="notes">Add or edit notes</Label>
              <Input
                value={inputValue}
                onChange={this.updateInput}
                name="notes"
                placeholder=""
                type="textarea"
                cols="50"
                rows="10"
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Col>
              {failureMessage.length > 0 && (
                <p className="text-danger text-wrap text-center mb-1">
                  {`Failed to update notes: ${failureMessage}`}
                </p>
              )}
            </Col>
            <Col className="text-right" lg="auto">
              <Button
                color="secondary"
                onClick={this.editNotes}
                // disabled={invalidInput || !inputValue.length || !validated}
                type="submit"
              >
                Assign
              </Button>
            </Col>
          </ModalFooter>
        </Form>
      </Modal>
    );
  }
}

NotesModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  alertSummary: PropTypes.shape({}).isRequired,
};
