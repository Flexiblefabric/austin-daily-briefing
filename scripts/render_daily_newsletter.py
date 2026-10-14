#!/usr/bin/env python3
"""ADB daily deterministic email renderer (layout is not model-generated)."""
import datetime as dt
import html
import json
import pathlib
import subprocess
import sys
from urllib.parse import urlparse

ROOT = pathlib.Path(__file__).resolve().parents[1]
MASTHEAD = 'https://raw.githubusercontent.com/Flexiblefabric/austin-daily-briefing/main/assets/brand/adb-masthead@2x.png'
MARK = 'https://raw.githubusercontent.com/Flexiblefabric/austin-daily-briefing/main/assets/brand/adb-mark-reversed@2x.png'
SITE = 'https://austindailybriefing.com/'
CUSTOMIZE = SITE + 'customize.html'
CORRECTIONS_LOG = SITE + 'corrections.html'
FEEDBACK = 'https://docs.google.com/forms/d/e/1FAIpQLSc_0-djww4qboFaEn9k-nEponrCBBqz-MCB81sOUtLjVsOZ7w/viewform'


def esc(value):
    return html.escape(str(value), quote=True)


def nonempty(obj, key):
    value = obj.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ValueError('Required nonempty text field: ' + key)
    return value.strip()


def url(value):
    value = str(value or '').strip()
    parsed = urlparse(value)
    if parsed.scheme != 'https' or not parsed.netloc or parsed.username or parsed.password:
        raise ValueError('Expected an HTTPS URL with no embedded credentials: ' + repr(value[:90]))
    return value


class Edition:
    def __init__(self, payload):
        self.data = payload
        self.h = []
        self.t = []

    def add(self, markup, text=None):
        self.h.append(markup)
        if text is not None:
            self.t.append(str(text))

    def link(self, prefix, name, target):
        target = url(target)
        label = prefix + ': ' + name + ' →'
        self.add('<p style="margin:10px 0 0;"><a href="' + esc(target) + '" style="display:inline-block;padding:8px 0;color:#8f1717;font-size:16px;font-weight:700;text-decoration:underline;">' + esc(label) + '</a></p>', prefix + ': ' + name + '\n' + target)

    def footer_link(self, label, target, primary=False):
        target = url(target)
        if primary:
            styles = 'display:inline-block;padding:12px 16px;background:#db2d2d;color:#fffefa;font-size:16px;font-weight:700;text-decoration:none;'
        else:
            styles = 'display:inline-block;padding:6px 8px;color:#fffefa;font-size:15px;text-decoration:underline;'
        self.add('<a href="' + esc(target) + '" style="' + styles + '">' + esc(label) + '</a>', label + '\n' + target)

    def section(self, name):
        self.add('<div class="major" style="padding:42px 0;border-bottom:1px solid #dedad1;">')
        self.add('<div style="margin:0 0 12px;color:#8f1717;font-family:Arial,sans-serif;font-size:14px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;">' + esc(name) + '</div>', name)

    def end(self):
        self.add('</div>')
        self.t.append('')

    def why(self, body):
        if not str(body or '').strip():
            raise ValueError('Required Why It Matters text missing')
        self.add('<div style="margin:16px 0 0;padding:15px 16px;border-left:4px solid #db2d2d;background:#f2efe8;">')
        self.add('<div style="margin:0 0 5px;color:#181818;font-family:Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">WHY IT MATTERS</div>')
        self.add('<p style="margin:0;font-size:16px;line-height:1.53;color:#2a2926;">' + esc(body) + '</p>', 'WHY IT MATTERS: ' + body)
        self.add('</div>')

    def sources(self, data, required=True):
        items = data.get('sources') or []
        if required and not items:
            raise ValueError('A sourced editorial item cannot have zero sources')
        for item in items:
            self.link('Source', nonempty(item, 'publisher'), nonempty(item, 'url'))

    def story(self, item, feature=False, radar=False):
        if feature:
            heading = 'h1'
            size = 31
        elif radar:
            heading = 'h2'
            size = 24
        else:
            heading = 'h2'
            size = 24
        title = nonempty(item, 'headline')
        self.add('<' + heading + ' style="margin:0;color:#181818;font-family:Georgia,\'Times New Roman\',serif;font-size:' + str(size) + 'px;line-height:1.17;font-weight:700;">' + esc(title) + '</' + heading + '>', title)
        if item.get('metadata'):
            self.add('<p style="margin:9px 0 0;color:#68635a;font-family:Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;">' + esc(item['metadata']) + '</p>', item['metadata'])
        summary = nonempty(item, 'summary')
        self.add('<p style="margin:14px 0 0;font-size:16px;line-height:1.57;color:#2a2926;">' + esc(summary) + '</p>', summary)
        self.why(nonempty(item, 'why'))
        self.sources(item)

    def build(self):
        p = self.data
        day = dt.date.fromisoformat(nonempty(p, 'date'))
        date_label = day.strftime('%A').upper() + ' · ' + day.strftime('%B').upper() + ' ' + str(day.day) + ', ' + str(day.year)
        if not isinstance(p.get('topStories'), list) or not p['topStories']:
            raise ValueError('At least one non-featured Top Story required')
        foot = p.get('footer') or {}
        manage = url(nonempty(foot, 'manageUrl'))  # approved PROD routing is caller-controlled
        preheader = str(p.get('preheader', '')).strip()
        self.add('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#ece9e2;color:#181818;font-family:Arial,Helvetica,sans-serif;">')
        self.add('<div style="display:none!important;max-height:0;max-width:0;opacity:0;overflow:hidden;color:transparent;">' + esc(preheader) + '</div>')
        self.add('<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#ece9e2;"><tr><td align="center" style="padding:18px 8px;">')
        self.add('<table role="presentation" width="620" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:620px;background:#fffefa;"><tr><td align="center" style="padding:30px 24px 22px;border-bottom:1px solid #dedad1;background:#fffefa;">')
        self.add('<img src="' + MASTHEAD + '" width="500" alt="Austin Daily Briefing" style="display:block;width:100%;max-width:500px;height:auto;border:0;">')
        self.add('<div style="margin-top:12px;color:#68635a;font-family:Arial,sans-serif;font-size:14px;font-weight:700;letter-spacing:1.1px;text-transform:uppercase;">' + esc(date_label) + '</div></td></tr><tr><td class="content-pad" style="padding:0 34px;background:#fffefa;">', date_label)

        self.section('AUSTIN PULSE')
        pulse = nonempty(p, 'pulse')
        self.add('<p style="margin:0;padding-left:18px;border-left:4px solid #db2d2d;color:#2a2926;font-family:Georgia,\'Times New Roman\',serif;font-size:21px;line-height:1.48;">' + esc(pulse) + '</p>', pulse)
        self.end()
        # Edition-level corrections appear immediately after Pulse, per component spec.
        if p.get('correction'):
            self.section('CORRECTION / CLARIFICATION')
            self.add('<p style="font-size:16px;line-height:1.55;">' + esc(p['correction']) + '</p>', p['correction'])
            self.end()

        weather = p.get('weather') or {}
        self.section('WEATHER')
        self.add('<p style="margin:0;font-size:16px;line-height:1.55;">' + esc(nonempty(weather, 'summary')) + '</p>', nonempty(weather, 'summary'))
        if weather.get('high') is not None and weather.get('low') is not None:
            temp = str(weather['high']) + '° / ' + str(weather['low']) + '°'
            self.add('<p style="margin:14px 0 0;color:#181818;font-size:30px;font-weight:800;">' + esc(temp) + '</p>', temp)
        self.link('Forecast', 'National Weather Service', nonempty(weather, 'url'))
        self.end()

        self.section('FEATURED TOP STORY')
        self.story(p.get('featured') or {}, feature=True)
        self.end()

        self.section('TOP STORIES')
        for item in p['topStories']:
            self.add('<div style="padding:0 0 26px;margin:0 0 24px;border-bottom:1px solid #dedad1;">')
            self.story(item)
            self.add('</div>')
        self.end()

        radar = p.get('underTheRadar')
        if radar:
            self.add('<div class="major" style="padding:46px 0;border-bottom:1px solid #dedad1;"><div style="border-top:5px solid #db2d2d;">')
            self.add('<div style="padding:14px 22px;background:#f2efe8;color:#181818;font-family:Arial,sans-serif;font-size:14px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;">UNDER THE RADAR</div>', 'UNDER THE RADAR')
            self.add('<div style="padding:24px 22px;background:#fffefa;">')
            self.story(radar,radar=True)
            self.add('</div></div></div>')
            self.t.append('')

        mfy = p.get('moreForYou') or []
        if mfy:
            self.section('MORE FOR YOU')
            self.add('<p style="font-size:14px;color:#68635a;">Selected based on your saved interests.</p>', 'Selected based on your saved interests.')
            for item in mfy:
                title = nonempty(item,'headline')
                self.add('<div style="padding:18px 0;border-bottom:1px solid #dedad1;">')
                self.add('<h3 style="margin:0;color:#181818;font-family:Georgia,\'Times New Roman\',serif;font-size:21px;line-height:1.2;">' + esc(title) + '</h3>', title)
                self.add('<p style="font-size:16px;line-height:1.55;">' + esc(nonempty(item,'summary')) + '</p>', nonempty(item,'summary'))
                if item.get('why'):
                    self.why(item['why'])
                self.sources(item)
                self.add('</div>')
            self.end()

        self.section('AUSTIN AHEAD')
        self.add('<p style="font-size:14px;color:#68635a;">What to attend, watch, and plan around in the days ahead.</p>', 'What to attend, watch, and plan around in the days ahead.')
        ahead = p.get('austinAhead') or []
        if not ahead:
            self.add('<p style="font-size:16px;">No major Austin Ahead items to flag today.</p>', 'No major Austin Ahead items to flag today.')
        for item in ahead:
            action = nonempty(item, 'action').upper()
            if action not in ('GO','WATCH','PLAN'):
                raise ValueError('Austin Ahead action must be exactly GO, WATCH or PLAN')
            when = nonempty(item, 'when')
            self.add('<div style="padding:15px 0;border-bottom:1px solid #dedad1;">')
            self.add('<div style="color:#8f1717;font-family:Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">' + esc(action + ' · ' + when) + '</div>', action + ' · ' + when)
            title = nonempty(item, 'title')
            self.add('<h3 style="margin:7px 0 0;color:#181818;font-family:Georgia,\'Times New Roman\',serif;font-size:20px;line-height:1.2;">' + esc(title) + '</h3>', title)
            if item.get('description'):
                self.add('<p style="font-size:16px;line-height:1.5;">' + esc(item['description']) + '</p>', item['description'])
            link_type = str(item.get('linkType') or 'Event details')
            if link_type not in ('Event details', 'Source'):
                raise ValueError('Austin Ahead linkType must be Event details or Source')
            self.link(link_type, nonempty(item,'organizer'), nonempty(item,'url'))
            self.add('</div>')
        self.end()

        recap = p.get('fridayRecap') or []
        if recap:
            if day.weekday() != 4 or len(recap) > 3:
                raise ValueError('Friday recap allowed only on Friday, maximum 3 points')
            self.section('THIS WEEK IN AUSTIN')
            for entry in recap:
                if not isinstance(entry, dict):
                    raise ValueError('Friday recap needs structured text and named source URLs')
                line = nonempty(entry, 'text')
                self.add('<p style="font-size:16px;line-height:1.55;">' + esc(line) + '</p>', line)
                self.sources(entry)
            self.end()
        if p.get('whatsNew'):
            self.section("WHAT'S NEW")
            self.add('<p style="font-size:16px;line-height:1.55;">' + esc(p['whatsNew']) + '</p>', p['whatsNew'])
            self.end()
        self.add('</td></tr><tr><td align="center" style="background:#181818;color:#fffefa;padding:26px 20px;text-align:center;">')
        self.add('<img src="' + MARK + '" width="54" alt="ADB" style="display:block;margin:0 auto 12px;width:54px;height:auto;">')
        self.add('<p style="font-size:14px;line-height:1.5;color:#e8ecef;">You’re receiving Austin Daily Briefing because this address is subscribed.</p>', 'You are receiving Austin Daily Briefing because this address is subscribed.')
        self.add('<p style="margin:16px 0 10px;">')
        self.footer_link('Manage / pause or unsubscribe', manage, primary=True)
        self.add('</p><p style="margin:0;">')
        self.footer_link('Website', SITE)
        self.footer_link('Customize', CUSTOMIZE)
        self.footer_link('Feedback & Corrections', url(foot.get('feedbackUrl') or FEEDBACK))
        self.footer_link('Corrections Log', CORRECTIONS_LOG)
        self.footer_link('Privacy', SITE + 'privacy.html')
        self.footer_link('Terms', SITE + 'terms.html')
        self.add('</p>')
        self.add('</td></tr></table></td></tr></table></body></html>')
        return '\n'.join(self.h), '\n\n'.join(self.t).rstrip() + '\n'


def main():
    if len(sys.argv) != 4:
        raise ValueError('Usage: python scripts/render_daily_newsletter.py input.json edition.html edition.txt')
    input_file, html_path, text_path = map(pathlib.Path, sys.argv[1:])
    data = json.loads(input_file.read_text(encoding='utf-8'))
    html_out, plain_out = Edition(data).build()
    if len(html_out) > 45000 or len(plain_out) > 45000:
        raise ValueError('Rendered edition exceeds Sheets 45000 character limit')
    html_path.write_text(html_out, encoding='utf-8')
    text_path.write_text(plain_out, encoding='utf-8')
    validator = ROOT / 'scripts' / 'validate_daily_newsletter.js'
    subprocess.run(['node', str(validator), str(html_path), str(text_path)], check=True)


if __name__ == '__main__':
    try:
        main()
    except (OSError, ValueError, subprocess.CalledProcessError) as exc:
        print('Daily newsletter render/validation failure: ' + str(exc), file=sys.stderr)
        sys.exit(1)