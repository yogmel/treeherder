import React from 'react';
import PropTypes from 'prop-types';
import {
  UncontrolledDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
} from 'reactstrap';
import moment from 'moment';

import {
  getAlertSummaryStatusText,
  getTextualSummary,
  getTitle,
} from '../helpers';
import { getData } from '../../helpers/http';
import { getApiUrl, bzBaseUrl, createQueryParams } from '../../helpers/url';

const StatusDropdown = ({ alertSummary, repos }) => {

  const fillTemplate = (template, replacement) => {
    let newTemplate = template;
    const regex = {
      revisionHref: /{+\srevisionHref\s}+/g,
      alertHref: /{+\salertHref\s}+/g,
      alertSummary: /{+\salertSummary\s}+/g,
    };

    for (const word of template.split(' ')) {
      if (regex[word]) {
        newTemplate = newTemplate.replace(regex[word], replacement[word]);
      }
    }
    return newTemplate;
  };

  const fileBug = async () => {
    // TODO it seems like it'd make more sense to fetch this once and customize/cache it for future use rather than
    // fetching this template each time someone clicks on 'file bug' - regardless of test framework
    const { data, failureStatus } = await getData(
      getApiUrl(
        `/performance/bug-template/?framework=${alertSummary.framework}`,
      ),
    );
    if (!failureStatus) {
      const result = data[0];
      // repos is an instance of RepositoryModel, accessed on the $rootScope
      const repo = repos.find(repo => repo.name === alertSummary.repository);

      const templateArgs = {
        revisionHref: repo.getPushLogHref(
          alertSummary.resultSetMetadata.revision,
        ),
        alertHref: `${window.location.origin}/perf.html#/alerts?id=${
          alertSummary.id
        }`,
        alertSummary: getTextualSummary(alertSummary),
      };
      const template = fillTemplate(result.text, templateArgs);

      const pushDate = moment(
        alertSummary.resultSetMetadata.push_timestamp * 1000,
      ).format('ddd MMMM D YYYY');

      const bugTitle = `${getTitle(alertSummary)} regression on push ${
        alertSummary.resultSetMetadata.revision
      } (${pushDate})`;

      window.open(
        `${bzBaseUrl}/enter_bug.cgi?${createQueryParams({
          cc: result.cc_list,
          comment: template,
          component: result.default_component,
          product: result.default_product,
          keywords: result.keywords,
          short_desc: bugTitle,
          status_whiteboard: result.status_whiteboard,
        })}`,
      );
    }
  };

  const copySummary = () => {
    const summary = getTextualSummary(alertSummary, true);
    // can't access the clipboardData on event unless it's done from react's
    // onCopy, onCut or onPaste props
    navigator.clipboard.writeText(summary).then(() => {});
  }

  return (
    <UncontrolledDropdown tag="span">
      <DropdownToggle
        className="btn-link text-info p-0"
        color="transparent"
        caret
      >
        {getAlertSummaryStatusText(alertSummary)}
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem onClick={copySummary}> Copy Summary</DropdownItem>
        <DropdownItem onClick={fileBug}>File bug</DropdownItem>
        {/* <DropdownItem>
        </DropdownItem> */}
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

StatusDropdown.propTypes = {
  alertSummary: PropTypes.shape({}).isRequired,
  repos: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default StatusDropdown;
