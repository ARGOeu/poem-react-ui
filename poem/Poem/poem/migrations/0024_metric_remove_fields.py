# Generated by Django 3.2.14 on 2022-08-16 13:42

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('poem', '0023_metric_probeversion'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='metric',
            name='attribute',
        ),
        migrations.RemoveField(
            model_name='metric',
            name='dependancy',
        ),
        migrations.RemoveField(
            model_name='metric',
            name='description',
        ),
        migrations.RemoveField(
            model_name='metric',
            name='fileparameter',
        ),
        migrations.RemoveField(
            model_name='metric',
            name='files',
        ),
        migrations.RemoveField(
            model_name='metric',
            name='flags',
        ),
        migrations.RemoveField(
            model_name='metric',
            name='mtype',
        ),
        migrations.RemoveField(
            model_name='metric',
            name='parameter',
        ),
        migrations.RemoveField(
            model_name='metric',
            name='parent',
        ),
        migrations.RemoveField(
            model_name='metric',
            name='probeexecutable',
        ),
        migrations.RemoveField(
            model_name='metric',
            name='probekey',
        ),
    ]