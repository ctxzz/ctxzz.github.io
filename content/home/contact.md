---
# An instance of the Contact widget.
widget: contact

# This file represents a page section.
headless: true

active: false  # Activate this widget? true/false

# Order that this section appears on the page.
weight: 130

title: Contact
subtitle:

content:
  # Automatically link email and phone or display as text?
  autolink: true

  # Email form provider
  form:
    provider: netlify
    formspree:
      id:
    netlify:
      # Enable CAPTCHA challenge to reduce spam?
      captcha: false

  # Contact details (edit or remove options as required)
  email: omata.atsushi.open@gmail.com
  # phone: 888 888 88 88
  address:
    street: 3-5-1 Johoku
    city: Hamamatsu-shi
    region: Shizuoka
    postcode: '432-8014'
    country: Japan
    country_code: JP
  coordinates:
    latitude: '34.7253'
    longitude: '137.7180'
  # directions: Enter Building 1 and take the stairs to Office 200 on Floor 2
  # office_hours:
  #   - 'Monday 10:00 to 13:00'
  #   - 'Wednesday 09:00 to 10:00'
  # appointment_url: 'https://calendly.com'
  contact_links:
    - icon: twitter
      icon_pack: fab
      name: DM Me
      link: 'https://twitter.com/ctxzz'
    # - icon: video
    #   icon_pack: fas
    #   name: Zoom Me
    #   link: 'https://zoom.com'

design:
  columns: '2'
---
