# unit_tests.py - unit suite for python_textfinder_output, per Spec_Python_TextFinder_Output.md

import io
import sys
import unittest

from python_textfinder_dirnav import Output
from python_textfinder_output import StdoutSink


class FakeStream:
    def __init__(self, buffer):
        self.buffer = buffer


class BrokenBuffer(io.BytesIO):
    def write(self, data):
        raise OSError("broken pipe")


class SinkFixture(unittest.TestCase):
    def setUp(self):
        self.out = io.BytesIO()
        self.err = io.BytesIO()
        self.saved = (sys.stdout, sys.stderr)
        sys.stdout = FakeStream(self.out)
        sys.stderr = FakeStream(self.err)

    def tearDown(self):
        sys.stdout, sys.stderr = self.saved

    def written(self):
        return self.out.getvalue()

    def noticed(self):
        return self.err.getvalue()


class Termination(SinkFixture):
    def test_output_adds_one_line_feed_and_never_a_carriage_return(self):
        with StdoutSink() as sink:
            sink.output("alpha")
            sink.output("beta")
        self.assertEqual(self.written(), b"alpha\nbeta\n")

    def test_embedded_line_feeds_are_not_translated(self):
        with StdoutSink() as sink:
            sink.write_text("one\ntwo\n")
        self.assertEqual(self.written(), b"one\ntwo\n")

    def test_write_text_adds_nothing(self):
        with StdoutSink() as sink:
            sink.write_text("bare")
        self.assertEqual(self.written(), b"bare")

    def test_encoding_is_utf_eight_with_no_byte_order_mark(self):
        with StdoutSink() as sink:
            sink.output("héllo")
        self.assertEqual(self.written(), "héllo\n".encode("utf-8"))
        self.assertFalse(self.written().startswith(b"\xef\xbb\xbf"))

    def test_a_lone_surrogate_is_replaced_rather_than_raised_or_passed_through(self):
        with StdoutSink() as sink:
            sink.output("a\udc80b")
        self.assertEqual(self.written(), b"a?b\n")


class OneSinkRule(SinkFixture):
    def test_a_second_sink_is_refused(self):
        with StdoutSink():
            with self.assertRaises(RuntimeError):
                StdoutSink()

    def test_a_released_sink_gives_the_right_back(self):
        with StdoutSink() as first:
            first.output("one")
        with StdoutSink() as second:
            second.output("two")
        self.assertEqual(self.written(), b"one\ntwo\n")


class Buffering(SinkFixture):
    def test_nothing_reaches_the_stream_before_a_flush(self):
        sink = StdoutSink()
        try:
            sink.output("held")
            self.assertEqual(self.written(), b"")
        finally:
            sink.__exit__(None, None, None)

    def test_flush_on_demand_drains_the_buffer(self):
        sink = StdoutSink()
        try:
            sink.output("held")
            sink.flush()
            self.assertEqual(self.written(), b"held\n")
        finally:
            sink.__exit__(None, None, None)

    def test_release_flushes(self):
        sink = StdoutSink()
        sink.output("held")
        sink.__exit__(None, None, None)
        self.assertEqual(self.written(), b"held\n")

    def test_release_is_safe_to_repeat(self):
        sink = StdoutSink()
        sink.output("held")
        sink.__exit__(None, None, None)
        sink.__exit__(None, None, None)
        self.assertEqual(self.written(), b"held\n")

    def test_release_does_not_close_the_stream_beneath_it(self):
        with StdoutSink() as sink:
            sink.output("held")
        self.assertFalse(self.out.closed)
        self.out.write(b"after")
        self.assertEqual(self.written(), b"held\nafter")

    def test_exit_returns_none_so_a_caller_defect_still_propagates(self):
        with self.assertRaises(ZeroDivisionError):
            with StdoutSink() as sink:
                sink.output("held")
                raise ZeroDivisionError()


class WriteFailure(SinkFixture):
    def setUp(self):
        super().setUp()
        self.out = BrokenBuffer()
        sys.stdout = FakeStream(self.out)

    def test_first_failure_writes_one_notice_to_stderr(self):
        sink = StdoutSink()
        sink.output("lost")
        sink.flush()
        sink.__exit__(None, None, None)
        self.assertEqual(self.noticed(), b"output failed\n")

    def test_the_notice_is_written_once_however_many_lines_follow(self):
        sink = StdoutSink()
        sink.output("lost")
        sink.flush()
        for _ in range(100):
            sink.output("also lost")
        sink.flush()
        sink.__exit__(None, None, None)
        self.assertEqual(self.noticed(), b"output failed\n")

    def test_failure_met_only_at_release_still_writes_the_notice(self):
        sink = StdoutSink()
        sink.output("lost")
        sink.__exit__(None, None, None)
        self.assertEqual(self.noticed(), b"output failed\n")

    def test_failure_is_never_reported_to_the_caller(self):
        with StdoutSink() as sink:
            sink.output("lost")
            sink.flush()
            sink.write_text("more")
            sink.flush()

    def test_a_failed_sink_still_gives_the_right_back(self):
        with StdoutSink() as sink:
            sink.output("lost")
            sink.flush()
        with StdoutSink() as second:
            second.output("also lost")


class BothStreamsBroken(SinkFixture):
    def setUp(self):
        super().setUp()
        self.out = BrokenBuffer()
        self.err = BrokenBuffer()
        sys.stdout = FakeStream(self.out)
        sys.stderr = FakeStream(self.err)

    def test_nothing_escapes_when_the_notice_cannot_be_written(self):
        with StdoutSink() as sink:
            sink.output("lost")
            sink.flush()
            sink.output("also lost")

    def test_nothing_escapes_when_release_is_the_first_failure(self):
        sink = StdoutSink()
        sink.output("lost")
        sink.__exit__(None, None, None)

    def test_the_sink_is_still_released(self):
        with StdoutSink() as sink:
            sink.output("lost")
            sink.flush()
        StdoutSink().__exit__(None, None, None)


class ProtocolConformance(SinkFixture):
    def test_the_sink_satisfies_the_output_protocol(self):
        with StdoutSink() as sink:
            self.assertIsInstance(sink, Output)

    def test_the_sink_names_the_protocol_as_a_base(self):
        self.assertIn(Output, StdoutSink.__mro__)

    def test_write_text_is_not_part_of_the_protocol(self):
        self.assertFalse(hasattr(Output, "write_text"))


if __name__ == "__main__":
    result = unittest.main(exit=False, verbosity=1).result
    sys.exit(len(result.failures) + len(result.errors))
