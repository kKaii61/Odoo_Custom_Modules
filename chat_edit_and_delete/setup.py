import setuptools
import os

here = os.path.abspath(os.path.dirname(__file__))

setuptools.setup(
    name='odoo-addon-chat_edit_and_delete',
    version='17.0.1.0.2',
    description='Chat Edit & Delete for Odoo 17',
    long_description=open('README.md').read(),
    author='Kainowf',
    author_email='kn06102003@gmail.com',
    url='https://kainowf.com/',
    license='LGPL-3',
    packages=setuptools.find_packages(),
    include_package_data=True,
    install_requires=[
        'odoo>=17.0',
    ],
    classifiers=[
        'Development Status :: 5 - Production/Stable',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: GNU Lesser General Public License v3 (LGPLv3)',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Programming Language :: Python :: 3.11',
        'Framework :: Odoo',
    ],
    python_requires='>=3.9',
)
