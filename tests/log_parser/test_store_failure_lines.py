import json

import pytest
import responses
from django.conf import settings
from requests.exceptions import HTTPError

from treeherder.log_parser.failureline import (
    store_failure_lines,
    write_failure_lines,
    get_group_results,
)
from treeherder.model.models import FailureLine, Group, JobLog, GroupStatus

from ..sampledata import SampleData


def test_store_error_summary(activate_responses, test_repository, test_job):
    log_path = SampleData().get_log_path("plain-chunked_errorsummary.log")
    log_url = 'http://my-log.mozilla.org'

    with open(log_path) as log_handler:
        responses.add(responses.GET, log_url, body=log_handler.read(), status=200)

    log_obj = JobLog.objects.create(job=test_job, name="errorsummary_json", url=log_url)

    store_failure_lines(log_obj)

    assert FailureLine.objects.count() == 1

    failure = FailureLine.objects.get(pk=1)

    assert failure.job_guid == test_job.guid

    assert failure.repository == test_repository


def test_store_error_summary_default_group(activate_responses, test_repository, test_job):
    log_path = SampleData().get_log_path("plain-chunked_errorsummary.log")
    log_url = 'http://my-log.mozilla.org'

    with open(log_path) as log_handler:
        resp_body = json.load(log_handler)

    resp_body["group"] = "default"
    responses.add(responses.GET, log_url, body=json.dumps(resp_body), status=200)

    log_obj = JobLog.objects.create(job=test_job, name="errorsummary_json", url=log_url)

    store_failure_lines(log_obj)

    assert FailureLine.objects.count() == 1


def test_store_error_summary_truncated(activate_responses, test_repository, test_job, monkeypatch):
    log_path = SampleData().get_log_path("plain-chunked_errorsummary_10_lines.log")
    log_url = 'http://my-log.mozilla.org'

    monkeypatch.setattr(settings, 'FAILURE_LINES_CUTOFF', 5)

    with open(log_path) as log_handler:
        responses.add(responses.GET, log_url, body=log_handler.read(), status=200)

    log_obj = JobLog.objects.create(job=test_job, name="errorsummary_json", url=log_url)

    store_failure_lines(log_obj)

    assert FailureLine.objects.count() == 5 + 1

    failure = FailureLine.objects.get(action='truncated')

    assert failure.job_guid == test_job.guid

    assert failure.repository == test_repository


def test_store_error_summary_astral(activate_responses, test_repository, test_job):
    log_path = SampleData().get_log_path("plain-chunked_errorsummary_astral.log")
    log_url = 'http://my-log.mozilla.org'

    with open(log_path, encoding='utf8') as log_handler:
        responses.add(
            responses.GET,
            log_url,
            content_type="text/plain;charset=utf-8",
            body=log_handler.read(),
            status=200,
        )

    log_obj = JobLog.objects.create(job=test_job, name="errorsummary_json", url=log_url)

    store_failure_lines(log_obj)

    assert FailureLine.objects.count() == 1

    failure = FailureLine.objects.get(pk=1)

    assert failure.job_guid == test_job.guid

    assert failure.repository == test_repository

    assert (
        failure.test
        == u"toolkit/content/tests/widgets/test_videocontrols_video_direction.html <U+01F346>"
    )
    assert failure.subtest == u"Test timed out. <U+010081>"
    assert failure.message == u"<U+0F0151>"
    assert failure.stack.endswith("<U+0F0151>")
    assert failure.stackwalk_stdout is None
    assert failure.stackwalk_stderr is None


def test_store_error_summary_404(activate_responses, test_repository, test_job):
    log_path = SampleData().get_log_path("plain-chunked_errorsummary.log")
    log_url = 'http://my-log.mozilla.org'

    with open(log_path) as log_handler:
        responses.add(responses.GET, log_url, body=log_handler.read(), status=404)

    log_obj = JobLog.objects.create(job=test_job, name="errorsummary_json", url=log_url)

    store_failure_lines(log_obj)

    log_obj.refresh_from_db()
    assert log_obj.status == JobLog.FAILED


def test_store_error_summary_500(activate_responses, test_repository, test_job):
    log_path = SampleData().get_log_path("plain-chunked_errorsummary.log")
    log_url = 'http://my-log.mozilla.org'

    with open(log_path) as log_handler:
        responses.add(responses.GET, log_url, body=log_handler.read(), status=500)

    log_obj = JobLog.objects.create(job=test_job, name="errorsummary_json", url=log_url)

    with pytest.raises(HTTPError):
        store_failure_lines(log_obj)

    log_obj.refresh_from_db()
    assert log_obj.status == JobLog.FAILED


def test_store_error_summary_duplicate(activate_responses, test_repository, test_job):
    log_url = 'http://my-log.mozilla.org'
    log_obj = JobLog.objects.create(job=test_job, name="errorsummary_json", url=log_url)

    write_failure_lines(
        log_obj, [{"action": "log", "level": "debug", "message": "test", "line": 1}]
    )
    write_failure_lines(
        log_obj,
        [
            {"action": "log", "level": "debug", "message": "test", "line": 1},
            {"action": "log", "level": "debug", "message": "test 1", "line": 2},
        ],
    )

    assert FailureLine.objects.count() == 2


def test_store_error_summary_group_status(activate_responses, test_repository, test_job):
    log_path = SampleData().get_log_path("mochitest-browser-chrome_errorsummary.log")
    log_url = 'http://my-log.mozilla.org'

    with open(log_path) as log_handler:
        responses.add(responses.GET, log_url, body=log_handler.read(), status=200)

    log_obj = JobLog.objects.create(job=test_job, name="errorsummary_json", url=log_url)
    store_failure_lines(log_obj)

    assert FailureLine.objects.count() == 5

    ok_groups = Group.objects.filter(group_result__status=GroupStatus.OK)
    error_groups = Group.objects.filter(group_result__status=GroupStatus.ERROR)

    assert ok_groups.count() == 28
    assert error_groups.count() == 1
    assert log_obj.groups.count() == 29

    assert log_obj.groups.all().first().name == "dom/base/test"
    assert ok_groups.first().name == "dom/base/test"
    assert error_groups.first().name == "toolkit/components/pictureinpicture/tests"


def test_get_group_results(activate_responses, test_repository, test_job):
    log_path = SampleData().get_log_path("mochitest-browser-chrome_errorsummary.log")
    log_url = 'http://my-log.mozilla.org'

    with open(log_path) as log_handler:
        responses.add(responses.GET, log_url, body=log_handler.read(), status=200)

    log_obj = JobLog.objects.create(job=test_job, name="errorsummary_json", url=log_url)
    store_failure_lines(log_obj)

    groups = get_group_results(test_job.push)
    task_groups = groups['V3SVuxO8TFy37En_6HcXLs']

    assert task_groups['dom/base/test']
